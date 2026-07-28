import React from "react";

const createItems = (count) => Array.from({ length: count }, (_, index) => index);

function Skeleton({ className = "", style }) {
  return <span aria-hidden="true" className={`skeleton ${className}`.trim()} style={style} />;
}

function LoadingRegion({ children, className = "", label }) {
  return (
    <div className={className} role="status" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">{label}</span>
      {children}
    </div>
  );
}

function PageHeadingSkeleton({ action = false }) {
  return (
    <div className="skeleton-page-heading" aria-hidden="true">
      <div className="skeleton-page-heading__copy">
        <Skeleton className="skeleton-page-heading__eyebrow" />
        <Skeleton className="skeleton-page-heading__title" />
        <Skeleton className="skeleton-page-heading__subtitle" />
      </div>
      {action && <Skeleton className="skeleton-page-heading__action" />}
    </div>
  );
}

function DashboardStatSkeleton() {
  return (
    <article className="stat-card skeleton-stat-card" aria-hidden="true">
      <Skeleton className="skeleton-stat-card__icon" />
      <div className="skeleton-stat-card__copy">
        <Skeleton className="skeleton-stat-card__label" />
        <Skeleton className="skeleton-stat-card__value" />
        <Skeleton className="skeleton-stat-card__detail" />
      </div>
    </article>
  );
}

function CardHeadingSkeleton() {
  return (
    <div className="skeleton-card-heading" aria-hidden="true">
      <Skeleton className="skeleton-card-heading__title" />
      <Skeleton className="skeleton-card-heading__subtitle" />
    </div>
  );
}

function TrendSkeleton() {
  const barHeights = [38, 57, 44, 73, 56, 84, 66];
  return (
    <div className="skeleton-chart" aria-hidden="true">
      <div className="skeleton-chart__legend">
        <Skeleton className="skeleton-chart__legend-item" />
        <Skeleton className="skeleton-chart__legend-item skeleton-chart__legend-item--short" />
      </div>
      <div className="skeleton-chart__plot">
        {createItems(3).map((index) => <span className="skeleton-chart__gridline" key={index} />)}
        <div className="skeleton-chart__bars">
          {barHeights.map((height, index) => <Skeleton className="skeleton-chart__bar" key={index} style={{ "--skeleton-height": `${height}%` }} />)}
        </div>
      </div>
    </div>
  );
}

function BreakdownSkeleton() {
  return (
    <div className="skeleton-donut" aria-hidden="true">
      <span className="skeleton-donut__ring" />
      <div className="skeleton-donut__legend">
        {createItems(4).map((index) => (
          <div className="skeleton-donut__legend-row" key={index}>
            <Skeleton className="skeleton-donut__legend-dot" />
            <Skeleton className={`skeleton-donut__legend-line skeleton-donut__legend-line--${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListSkeleton({ compact = false }) {
  const count = compact ? 3 : 4;
  return (
    <div className="skeleton-list" aria-hidden="true">
      {createItems(count).map((index) => (
        <div className="skeleton-list__row" key={index}>
          <Skeleton className="skeleton-list__avatar" />
          <div className="skeleton-list__copy">
            <Skeleton className="skeleton-list__title" />
            <Skeleton className="skeleton-list__detail" />
          </div>
          <Skeleton className="skeleton-list__amount" />
        </div>
      ))}
    </div>
  );
}

export function AppBootSkeleton() {
  return (
    <LoadingRegion className="app-boot app-boot-skeleton" label="Opening your money space">
      <aside className="app-boot-skeleton__sidebar" aria-hidden="true">
        <Skeleton className="app-boot-skeleton__brand" />
        <div className="app-boot-skeleton__nav">
          {createItems(4).map((index) => <Skeleton className="app-boot-skeleton__nav-item" key={index} />)}
        </div>
        <Skeleton className="app-boot-skeleton__footer" />
      </aside>
      <div className="app-boot-skeleton__main" aria-hidden="true">
        <div className="app-boot-skeleton__topbar">
          <Skeleton className="app-boot-skeleton__month" />
          <Skeleton className="app-boot-skeleton__button" />
          <Skeleton className="app-boot-skeleton__profile" />
        </div>
        <div className="app-boot-skeleton__body">
          <div className="surface-card skeleton-page-header-card">
            <PageHeadingSkeleton action />
          </div>
          <div className="app-boot-skeleton__metrics">
            {createItems(4).map((index) => <Skeleton className="app-boot-skeleton__metric" key={index} />)}
          </div>
          <div className="app-boot-skeleton__panels">
            <Skeleton className="app-boot-skeleton__panel app-boot-skeleton__panel--wide" />
            <Skeleton className="app-boot-skeleton__panel" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}

export function DashboardSkeleton() {
  return (
    <LoadingRegion className="dashboard-page dashboard-skeleton" label="Loading your financial overview">
      <div className="surface-card skeleton-page-header-card" aria-hidden="true">
        <PageHeadingSkeleton action />
      </div>
      <section className="stat-grid" aria-hidden="true">
        {createItems(4).map((index) => <DashboardStatSkeleton key={index} />)}
      </section>
      <section className="analytics-grid" aria-hidden="true">
        <article className="surface-card skeleton-surface-card">
          <CardHeadingSkeleton />
          <TrendSkeleton />
        </article>
        <article className="surface-card skeleton-surface-card">
          <CardHeadingSkeleton />
          <BreakdownSkeleton />
        </article>
      </section>
      <section className="dashboard-lower-grid" aria-hidden="true">
        <article className="surface-card skeleton-surface-card">
          <CardHeadingSkeleton />
          <ListSkeleton />
        </article>
        <article className="surface-card skeleton-surface-card">
          <CardHeadingSkeleton />
          <ListSkeleton compact />
        </article>
      </section>
    </LoadingRegion>
  );
}

export function BudgetsSkeleton() {
  return (
    <LoadingRegion className="budget-skeleton" label="Loading budgets">
      {createItems(6).map((index) => (
        <article className="budget-card budget-card--skeleton" key={index} aria-hidden="true">
          <div className="budget-card__topline">
            <div className="budget-skeleton__category"><Skeleton className="budget-skeleton__dot" /><Skeleton className="budget-skeleton__name" /></div>
            <Skeleton className="budget-skeleton__action" />
          </div>
          <div className="budget-skeleton__numbers"><Skeleton /><Skeleton /></div>
          <Skeleton className="budget-skeleton__progress" />
          <div className="budget-skeleton__footer"><Skeleton /><Skeleton /></div>
        </article>
      ))}
    </LoadingRegion>
  );
}

export function CategoriesSkeleton() {
  return (
    <LoadingRegion className="category-grid category-grid--skeleton" label="Loading categories">
      {createItems(8).map((index) => (
        <article className="category-card category-card--skeleton" key={index} aria-hidden="true">
          <Skeleton className="category-skeleton__swatch" />
          <Skeleton className="category-skeleton__name" />
          <Skeleton className="category-skeleton__type" />
        </article>
      ))}
    </LoadingRegion>
  );
}

function TransactionSkeletonRow() {
  return (
    <div className="transaction-row transaction-row--skeleton" aria-hidden="true">
      <Skeleton className="transaction-skeleton__icon" />
      <div className="transaction-skeleton__title">
        <Skeleton className="transaction-skeleton__title-line" />
        <Skeleton className="transaction-skeleton__note-line" />
      </div>
      <Skeleton className="transaction-skeleton__category" />
      <Skeleton className="transaction-skeleton__date" />
      <Skeleton className="transaction-skeleton__amount" />
      <div className="transaction-skeleton__actions">
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  );
}

export function TransactionsSkeleton() {
  return (
    <LoadingRegion className="transaction-list transaction-list--skeleton" label="Loading transactions">
      <div className="transaction-list__head" aria-hidden="true">
        {createItems(6).map((index) => <Skeleton className="skeleton-table-heading" key={index} />)}
      </div>
      {createItems(5).map((index) => <TransactionSkeletonRow key={index} />)}
    </LoadingRegion>
  );
}
