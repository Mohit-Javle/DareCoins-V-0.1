import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav({ onOpenCreate }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active path
    const currentPath = location.pathname.replace('/', '');

    return (
        <div className="bottom-nav-container">
            <div className="bottom-nav">
                <div
                    className={`nav-item ${currentPath === 'dashboard' ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard')}
                >
                    <i className="ri-home-4-fill"></i>
                    <span>Home</span>
                </div>

                <div
                    className={`nav-item ${currentPath === 'explore' ? 'active' : ''}`}
                    onClick={() => navigate('/explore')}
                >
                    <i className="ri-compass-3-fill"></i>
                    <span>Explore</span>
                </div>



                <div
                    className={`nav-item ${currentPath === 'leaderboard' ? 'active' : ''}`}
                    onClick={() => navigate('/leaderboard')}
                >
                    <i className="ri-trophy-fill"></i>
                    <span>Rank</span>
                </div>

                <div
                    className={`nav-item ${currentPath === 'feed' ? 'active' : ''}`}
                    onClick={() => navigate('/feed')}
                >
                    <i className="ri-fire-fill"></i>
                    <span>Feed</span>
                </div>
                <div className="create-btn" onClick={onOpenCreate}>
                    <i className="ri-add-line"></i>
                </div>
            </div>
        </div>
    );
}
