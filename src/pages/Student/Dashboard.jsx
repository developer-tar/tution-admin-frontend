import React from "react";
import WelcomHeader from "../Dashboard/WelcomHeader";
import CurrentAssign from "../Dashboard/CurrentAssign";
import WeeklyPerformance from "../Dashboard/WeeklyPerformance";


const Dashboard = () => {
  return (
    <div>
      <WelcomHeader />
      <CurrentAssign />
      <WeeklyPerformance />

    </div>
  );
};

export default Dashboard;
