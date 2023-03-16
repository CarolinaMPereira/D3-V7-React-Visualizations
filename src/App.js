import { Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";
import OneSidedBarChart from "./components/OneSidedBarChart";
import Scatterplot from "./components/Scatterplot";
import TwoSidedBarChart from "./components/TwoSidedBarChart";
import ParallelCoordinatesPlot from "./components/ParallelCoordinatesPlot";
import "bootstrap/dist/css/bootstrap.css";

export default function App() {
  const location = useLocation();

  return (
    <div>
      <ul className="nav nav-pills justify-content-center flex-column flex-sm-row">
        <li className="nav-item">
          <Link to="/one-sided-barchart" className="nav-link">
            One sided Bar Chart
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/two-sided-barchart/" className="nav-link">
            Two sided Bar Chart
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/parallel-coordinates-plot/" className="nav-link">
            Parallel Coordinates Plot
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/scatterplot/" className="nav-link">
            Scatterplot
          </Link>
        </li>
      </ul>

      <div className="app-content">
        <Routes>
          <Route path="/one-sided-barchart" element={<OneSidedBarChart />} />
          <Route path="/two-sided-barchart" element={<TwoSidedBarChart />} />
          <Route
            path="/parallel-coordinates-plot"
            element={<ParallelCoordinatesPlot />}
          />
          <Route path="/scatterplot" element={<Scatterplot />} />
        </Routes>
      </div>
    </div>
  );
}
