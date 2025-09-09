import { NavLink } from "react-router-dom";

export default function MarketNav({ money = 0, reservationsCount = 0 }) {
    const link = ({ isActive }) => "subnav-link" + (isActive ? " active" : "");
    return (
        <div className="market-subnav">
            <NavLink to="/market/create" className={link}>Create product</NavLink>
            <NavLink to="/market" className={link}>All products</NavLink>
            <NavLink to="/market/my" className={link}>My reservations ({reservationsCount})</NavLink>
            <div className="subnav-money">Money for reservation: €{Number(money).toFixed(2)}</div>
        </div>
    );
}
