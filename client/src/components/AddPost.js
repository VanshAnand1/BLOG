import { useState } from "react";
import api from "../http";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";
import { useToast } from "../ui/ToastProvider";

export const AddPost = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/addpost", { text });
      console.log(res.data);
      setText("");
      navigate("/home");
    } catch (err) {
      console.error("addpost error:", err.response?.status, err.response?.data);
      toast.error(err?.response?.data?.error || "Add comment failed");
    }
  };

  return (
    <div className="min-h-screen">
      <NavigationBar />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <form
          onSubmit={submitHandler}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm"
        >
          <h1 className="text-center text-2xl font-semibold text-teagreen mb-6">
            Add a Post
          </h1>

          <label
            htmlFor="text"
            className="block text-sm text-aliceblue/90 mb-2"
          >
            Post Text
          </label>

          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="What's on your mind?"
            className="block w-full min-h-[160px] resize-y rounded-lg border border-white/10 bg-transparent px-3 py-2 text-aliceblue placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-teagreen focus:border-teagreen"
          />

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setText("")}
              className="px-3 py-1.5 rounded-md border border-white/10 text-aliceblue/90 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-3 py-1.5 rounded-md bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
