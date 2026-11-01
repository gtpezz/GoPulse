import "../styles.css";
import StatusBadge from "./StatusBadge";

export default function Header({ connected, lastUpdate }) {
  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">GoPulse</h1>
        <span className="header__subtitle">System Monitor</span>
      </div>
      <div className="header__right">
        {lastUpdate && (
          <span className="header__time">обновлено {lastUpdate}</span>
        )}
        <StatusBadge connected={connected} />
      </div>
    </header>
  );
}