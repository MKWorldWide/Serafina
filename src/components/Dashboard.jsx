import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

const Dashboard = () => {
  const { user, matches } = useStore((state) => ({
    user: state.user,
    matches: state.matches
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Welcome {user?.username || 'Gamer'}!</h2>
          <p>Find your perfect gaming match today.</p>
          <div className="card-actions justify-end">
            <Link to="/matches" className="btn btn-primary">Find Matches</Link>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Matches</h2>
          {matches.length > 0 ? (
            <ul className="menu bg-base-200 rounded-box">
              {matches.slice(0, 5).map((match) => (
                <li key={match.id}>
                  <Link to={`/messages/${match.id}`}>
                    <div className="flex items-center gap-4">
                      <img src={match.avatar} alt={match.username} className="w-10 h-10 rounded-full" />
                      <span>{match.username}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No matches yet. Start browsing to find gaming partners!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 