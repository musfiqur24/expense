import React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

function normaliseOption(option) {
  return {
    value: String(option?.value ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    searchText: String(option?.searchText ?? option?.label ?? option?.value ?? "").toLocaleLowerCase(),
    disabled: Boolean(option?.disabled)
  };
}

export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search options",
  emptyMessage = "No matching options.",
  ariaLabel,
  className = "",
  leadingIcon: LeadingIcon,
  disabled = false
}) {
  const rootRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const normalisedOptions = React.useMemo(
    () => (options || []).map(normaliseOption),
    [options]
  );
  const selected = normalisedOptions.find((option) => option.value === String(value ?? ""));
  const filteredOptions = normalisedOptions.filter((option) => option.searchText.includes(query.trim().toLocaleLowerCase()));

  const close = React.useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  React.useEffect(() => {
    function closeOnOutsidePointer(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) close();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [close]);

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const frame = window.requestAnimationFrame(() => searchRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  function choose(option) {
    if (option.disabled) return;
    onChange(option.value);
    close();
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "Enter" && filteredOptions.length === 1) {
      event.preventDefault();
      choose(filteredOptions[0]);
    }
  }

  return (
    <div className={`searchable-select ${isOpen ? "is-open" : ""} ${className}`.trim()} ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="searchable-select__trigger"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        type="button"
      >
        {LeadingIcon && <LeadingIcon aria-hidden="true" className="searchable-select__leading-icon" size={16} />}
        <span className="searchable-select__value">{selected?.label || placeholder}</span>
        <ChevronDown aria-hidden="true" className="searchable-select__chevron" size={16} />
      </button>

      {isOpen && (
        <div className="searchable-select__menu">
          <div className="searchable-select__search">
            <Search aria-hidden="true" size={15} />
            <input
              aria-label={searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              ref={searchRef}
              value={query}
            />
          </div>
          <div className="searchable-select__options" role="listbox" aria-label={ariaLabel}>
            {filteredOptions.length ? filteredOptions.map((option) => (
              <button
                aria-selected={option.value === String(value ?? "")}
                className={`searchable-select__option ${option.value === String(value ?? "") ? "is-selected" : ""}`}
                disabled={option.disabled}
                key={option.value}
                onClick={() => choose(option)}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {option.value === String(value ?? "") && <Check aria-hidden="true" size={15} />}
              </button>
            )) : <p className="searchable-select__empty">{emptyMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
