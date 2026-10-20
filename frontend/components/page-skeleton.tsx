export function ManageSkeleton() {
  return (
    <main className="manage-page skeleton-page" aria-busy="true" aria-label="Đang tải không gian của bạn">
      <header className="manage-header"><span className="skeleton-block skeleton-brand" /><span className="skeleton-block skeleton-nav" /><span className="skeleton-block skeleton-avatar" /></header>
      <div className="manage-main">
        <div className="skeleton-title-row"><div><span className="skeleton-block skeleton-kicker" /><span className="skeleton-block skeleton-title" /><span className="skeleton-block skeleton-description" /></div><span className="skeleton-block skeleton-button" /></div>
        <div className="skeleton-overview"><span /><span /><span /><span /></div>
        <div className="skeleton-tab-row"><span /><span /><span /></div>
        <div className="skeleton-request-list">{[0, 1, 2].map((index) => <div className="skeleton-request-card" key={index}><span className="skeleton-block skeleton-item-mark" /><div><span className="skeleton-block skeleton-kicker" /><span className="skeleton-block skeleton-card-title" /><span className="skeleton-block skeleton-description" /></div><span className="skeleton-block skeleton-badge" /></div>)}</div>
      </div>
    </main>
  );
}

export function ItemEditorSkeleton() {
  return (
    <main className="editor-page skeleton-page" aria-busy="true" aria-label="Đang tải biểu mẫu món đồ">
      <header className="manage-header"><span className="skeleton-block skeleton-brand" /><span className="skeleton-block skeleton-nav" /></header>
      <div className="skeleton-editor-layout"><div><span className="skeleton-block skeleton-kicker" /><span className="skeleton-block skeleton-title" /><span className="skeleton-block skeleton-description" /></div><div className="skeleton-editor-form">{[0, 1, 2, 3].map((index) => <span className="skeleton-block skeleton-input" key={index} />)}</div></div>
    </main>
  );
}

export function SiteSkeleton() {
  return (
    <main className="site-skeleton" aria-busy="true" aria-label="Đang tải UniLend">
      <header className="site-skeleton-header"><span className="skeleton-block skeleton-brand" /><span className="skeleton-block skeleton-nav" /><span className="skeleton-block skeleton-button" /></header>
      <section className="site-skeleton-hero"><div><span className="skeleton-block skeleton-kicker" /><span className="skeleton-block skeleton-title" /><span className="skeleton-block skeleton-description" /><span className="skeleton-block skeleton-search" /></div><span className="skeleton-block skeleton-hero-art" /></section>
      <section className="site-skeleton-grid">{[0, 1, 2].map((index) => <span className="skeleton-block skeleton-product" key={index} />)}</section>
    </main>
  );
}