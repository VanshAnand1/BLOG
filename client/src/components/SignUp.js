import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/signup", { username, password });

      await axios.post(
        "/signin",
        { username, password },
        { withCredentials: true }
      );

      setUsername("");
      setPassword("");
      navigate("/home");
    } catch (err) {
      console.error(
        "signup/signin error:",
        err.response?.status,
        err.response?.data
      );
      alert(err.response?.data?.error || "Could not complete sign up");
    }
  };

  return (
    <div>
      <form
        onSubmit={submitHandler}
        className="mx-auto border-2 p-9 md:p-12 w-72 md:w-96 border-aliceblue mt-36 h-84"
      >
        <h1 className="pb-6 text-2xl text-center text-glow text-teagreen">
          Sign Up
        </h1>
        <label htmlFor="username" className="block mb-1 text-xl text-aliceblue">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full h-8 p-1 mb-6 focus:outline-none"
          required
        ></input>

        <label htmlFor="password" className="block mb-1 text-xl text-aliceblue">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-8 p-1 mb-6 focus:outline-none"
          required
        ></input>
        <div className="flex justify-between">
          <button type="button" className="px-3 py-1 rounded-sm bg-aliceblue">
            Cancel
          </button>
          <button type="submit" className="px-3 py-1 rounded-sm bg-aliceblue">
            Submit
          </button>
          <Link
            to="/"
            className="px-3 py-1 rounded-sm bg-aliceblue inline-block"
          >
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};
