import { Routes, Route, Navigate } from "react-router-dom";
import { Homepage } from "./components/Homepage";
import Profile from "./components/Profile";
import { SignUp } from "./components/SignUp";
import { SignIn } from "./components/SignIn";
import { AddPost } from "./components/AddPost";
import PostPage from "./components/PostPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Homepage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/addpost" element={<AddPost />} />
      <Route path="/logout" element={<SignIn />} />
      <Route path="/posts/:id" element={<PostPage />} />
      {/* catch-all: send unknown hashes to / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
