import { Navigate, Route, Routes } from "react-router-dom";
import AnalyticsListener from "./components/AnalyticsListener.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChooseRole from "./pages/ChooseRole.jsx";
import ParentHome from "./pages/ParentHome.jsx";
import CreateTask from "./pages/CreateTask.jsx";
import RewardCenter from "./pages/RewardCenter.jsx";
import ParentStats from "./pages/ParentStats.jsx";
import FamilyManage from "./pages/FamilyManage.jsx";
import ChildHome from "./pages/ChildHome.jsx";
import ChildShop from "./pages/ChildShop.jsx";
import ChildGamePark from "./pages/ChildGamePark.jsx";
import ChildLanguageBottles from "./pages/ChildLanguageBottles.jsx";
import ChildWorldExplorer from "./pages/ChildWorldExplorer.jsx";
import ChildWordBook from "./pages/ChildWordBook.jsx";
import ChildWordReview from "./pages/ChildWordReview.jsx";
import ChildLanguageExchange from "./pages/ChildLanguageExchange.jsx";
import ParentExchangeHub from "./pages/ParentExchangeHub.jsx";
import ChildStoryBook from "./pages/ChildStoryBook.jsx";

export default function App() {
  return (
    <>
      <AnalyticsListener />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/choose-role" element={<ChooseRole />} />
        <Route path="/parent" element={<ParentHome />} />
        <Route path="/parent/tasks/new" element={<CreateTask />} />
        <Route path="/parent/rewards" element={<RewardCenter />} />
        <Route path="/parent/stats" element={<ParentStats />} />
        <Route path="/parent/family" element={<FamilyManage />} />
        <Route path="/parent/videos" element={<Navigate to="/parent/exchange" replace />} />
        <Route path="/parent/exchange" element={<ParentExchangeHub />} />
        <Route path="/child" element={<ChildHome />} />
        <Route path="/child/shop" element={<ChildShop />} />
        <Route path="/child/park" element={<ChildGamePark />} />
        <Route path="/child/play/bottles" element={<ChildLanguageBottles />} />
        <Route path="/child/play/storybook" element={<ChildStoryBook />} />
        <Route path="/child/play/storybook/:bookId" element={<ChildStoryBook />} />
        <Route path="/child/play/bubbles" element={<Navigate to="/child/play/bottles" replace />} />
        <Route path="/child/play/language-world" element={<Navigate to="/child/play/bottles" replace />} />
        <Route path="/child/play/english-world" element={<Navigate to="/child/play/bottles" replace />} />
        <Route path="/child/explore" element={<ChildWorldExplorer />} />
        <Route path="/child/explore/review" element={<ChildWordReview />} />
        <Route path="/child/explore/words" element={<ChildWordBook />} />
        <Route path="/child/exchange" element={<ChildLanguageExchange />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}