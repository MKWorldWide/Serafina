import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const Navbar = () => {
  const { user, logout } = useStore(state => ({
    user: state.user,
    logout: state.logout,
  }));

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          GameDin
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/matches">Find Matches</Link>
          </li>
          <li>
            <Link to="/messages">Messages</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <li>
              <button className="btn btn-primary">Login</button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
