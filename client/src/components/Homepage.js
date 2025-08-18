import { DisplayPosts } from "./DisplayPosts";
import { NavigationBar } from "./NavigationBar";

export const Homepage = () => {
  return (
    <div>
      <NavigationBar></NavigationBar>
      <DisplayPosts></DisplayPosts>
    </div>
  );
};
