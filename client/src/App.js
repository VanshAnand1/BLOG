import { Homepage } from "./components/Homepage.js";
import { Signup } from "./components/Signup.js";
import axios from "axios";
function App() {
  const apiCall = () => {
    axios.get("http://localhost:8080").then((data) => {
      console.log(data);
    });
  };
  return (
    <div>
      <Signup></Signup>
      {/* <Homepage></Homepage> */}
      {/* <button onClick={apiCall}>make api call</button> */}
    </div>
  );
}

export default App;
