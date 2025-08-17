import react, { useState } from "react";
import axios from "axios";

export const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8080/signup", {
        username: username,
        password: password,
      })
      .then((data) => {
        console.log(data);
        setUsername("");
        setPassword("");
      });
  };
  return (
    <div>
      <form
        onSubmit={submitHandler}
        className="mx-auto border-2 p-9 md:p-12 w-72 md:w-96 border-aliceblue mt-36 h-84"
      >
        <h1 className="pb-6 text-2xl text-center text-glow text-teagreen">
          SignUp
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
        ></input>
        <div className="flex justify-between">
          <button type="button" className="px-3 py-1 rounded-sm bg-aliceblue">
            Cancel
          </button>
          <button type="submit" className="px-3 py-1 rounded-sm bg-aliceblue">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
