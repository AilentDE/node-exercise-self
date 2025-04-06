import { useState, useEffect } from "react";

import helloWorld from "../actions/helloWorld";

const Home = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    helloWorld().then((data) => {
      console.log(data);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1>Home</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default Home;
