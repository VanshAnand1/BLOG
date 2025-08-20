import { Routes, Route } from "react-router-dom";
import { Homepage } from "./components/Homepage";
import { SignUp } from "./components/SignUp";
import { SignIn } from "./components/SignIn";
import { AddPost } from "./components/AddPost";
import SearchResults from "./components/SearchResults";
import PostPage from "./components/PostPage";
import RequireAuth from "./RequireAuth";
import UserProfile from "./components/UserProfile";
import ProfileSearch from "./components/UserSearch";
import FollowListPage from "./components/FollowListPage";

function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/home" element={<Homepage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/u/:username" element={<UserProfile />} />
      <Route path="/profiles/search" element={<ProfileSearch />} />
      <Route path="/posts/:id" element={<PostPage />} />

      <Route path="/logout" element={<SignIn />} />
      <Route path="/" element={<SignIn />} />

      {/* protected */}
      <Route element={<RequireAuth />}>
        <Route path="/addpost" element={<AddPost />} />
        <Route
          path="/u/:username/following"
          element={<FollowListPage type="following" />}
        />
        <Route
          path="/u/:username/followers"
          element={<FollowListPage type="followers" />}
        />
      </Route>

      {/* fallback */}
      <Route path="*" element={<SignIn />} />
    </Routes>
  );
}

export default App;
