import { Link } from "react-router-dom";

export const Profile = () => {
  const name = "hi";
  return (
    <div className="flex items-center justify-between px-8 py-2">
      <Link to="/home">
        <h1 className="text-zomp large-text text-glow">
          Hi {name}, click me to go back to homepage
        </h1>
      </Link>
    </div>
  );
};
