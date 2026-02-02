import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">

                {/* Brand */}
                <div className="footer-brand">
                    <div className="footer-logo">
                        <i className="ri-shield-check-fill footer-logo-icon"></i>
                        DARECOIN
                    </div>
                    <p className="footer-desc">
                        The world's first decentralized platform where challenges meet rewards.
                        Prove yourself, earn crypto, and build your legacy on the blockchain.
                    </p>
                </div>

                {/* Explore */}
                <div>
                    <h4 className="footer-title">Explore</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Trending Dares</Link></li>
                        <li><Link to="/feed">Live Feed</Link></li>
                        <li><Link to="/wallet">Wallet</Link></li>
                        <li><Link to="/profile">Leaderboards</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 className="footer-title">Company</h4>
                    <ul className="footer-links">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Press Kit</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>

                {/* Newsletter & Social */}
                <div className="footer-newsletter">
                    <h4 className="footer-title">Stay Updated</h4>
                    <div className="newsletter-box">
                        <input type="email" placeholder="Enter your email" className="newsletter-input" />
                        <button className="newsletter-btn">
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                    <div className="footer-socials">
                        <div className="social-icon"><i className="ri-twitter-x-fill"></i></div>
                        <div className="social-icon"><i className="ri-discord-fill"></i></div>
                        <div className="social-icon"><i className="ri-instagram-fill"></i></div>
                        <div className="social-icon"><i className="ri-telegram-fill"></i></div>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <div>© 2024 DareCoin Platform. All rights reserved.</div>
                <div className="footer-bottom-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Settings</a>
                </div>
            </div>
        </footer>
    );
}
