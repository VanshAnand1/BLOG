import { Routes, Route } from "react-router-dom";
import { Homepage } from "./components/Homepage";
import Profile from "./components/Profile";
import { SignUp } from "./components/SignUp";
import { SignIn } from "./components/SignIn";
import { AddPost } from "./components/AddPost";
import SearchResults from "./components/SearchResults";
import PostPage from "./components/PostPage";
import RequireAuth from "./RequireAuth";
import UserProfile from "./components/UserProfile";

function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/" element={<SignIn />} />
      <Route path="/home" element={<Homepage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/u/:username" element={<UserProfile />} />

      <Route path="/signup" element={<SignUp />} />
      <Route path="/logout" element={<SignIn />} />
      <Route path="/posts/:id" element={<PostPage />} />

      {/* protected */}
      <Route element={<RequireAuth />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/addpost" element={<AddPost />} />
        {/* any other private routes */}
      </Route>

      {/* fallback */}
      <Route path="*" element={<SignIn />} />
    </Routes>
  );
}

export default App;
