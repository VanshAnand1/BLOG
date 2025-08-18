import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AddPost = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    axios
      .post("/addpost", { text }, { withCredentials: true })
      .then((data) => {
        console.log(data);
        setText("");
        navigate("/home");
      })
      .catch((err) => {
        console.error(err);
        alert(err.response?.data?.error || "Add post failed");
      });
  };

  return (
    <div>
      <form
        onSubmit={submitHandler}
        className="mx-auto border-2 p-9 md:p-12 w-72 md:w-96 border-aliceblue mt-36 h-84"
      >
        <h1 className="pb-6 text-2xl text-center text-glow text-teagreen">
          Add a Post
        </h1>
        <label htmlFor="text" className="block mb-1 text-xl text-aliceblue">
          Post Text
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 p-1 mb-6 focus:outline-none"
          required
        />
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
