export default function DareList({ dares, activeDareId, onSelectDare, activeTab, setActiveTab }) {
    return (
        <div className="left-panel">
            <div className="section-header">
                <h2 className="trending-title">Trending Dare</h2>
                <div className="tabs">
                    <div
                        className={`tab ${activeTab === 'System' ? 'active' : ''}`}
                        onClick={() => setActiveTab('System')}
                    >
                        System
                    </div>
                    <div
                        className={`tab ${activeTab === 'Player' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Player')}
                    >
                        Player
                    </div>
                </div>
            </div>

            <div className="dare-list">
                {dares.map((dare) => (
                    <div
                        key={dare.id}
                        className={`dare-item ${activeDareId === dare.id ? 'active' : ''}`}
                        onClick={() => onSelectDare(dare.id)}
                    >
                        <div className="dare-info">
                            <div className="play-btn-small">
                                <i className={dare.type === 'truth' ? "ri-question-mark" : "ri-play-fill"}></i>
                            </div>
                            <div className="dare-text">
                                <span className="dare-title-sm">{dare.title}</span>
                                <span className="dare-sub">{dare.subtitle}</span>
                            </div>
                        </div>
                        <i className="ri-arrow-right-s-line arrow-icon"></i>
                    </div>
                ))}
            </div>
        </div>
    );
}
