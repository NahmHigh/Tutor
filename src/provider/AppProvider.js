import React, { createContext, useContext, useState, useEffect } from "react";
import { instance } from "../lib/axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // State cho AdminDashboard
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    totalSchedules: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch tất cả data
      const [
        usersRes,
        tutorsRes,
        studentsRes,
        schedulesRes,
        reviewsRes,
        attendanceRes,
        locationsRes,
        subjectsRes,
      ] = await Promise.all([
        instance.get("/users"),
        instance.get("/tutors"),
        instance.get("/students"),
        instance.get("/schedules"),
        instance.get("/reviews"),
        instance.get("/attendance"),
        instance.get("/locations"),
        instance.get("/subjects"),
      ]);

      // Cập nhật state
      setUsers(usersRes.data);
      setTutors(tutorsRes.data);
      setStudents(studentsRes.data);
      setSchedules(schedulesRes.data);
      setReviews(reviewsRes.data);
      setAttendance(attendanceRes.data);
      setLocations(locationsRes.data);
      setSubjects(subjectsRes.data);

      // Cập nhật stats
      setStats({
        totalUsers: usersRes.data.length,
        totalTutors: tutorsRes.data.length,
        totalStudents: usersRes.data.filter((u) => u.role === "student").length,
        totalSchedules: schedulesRes.data.length,
      });
    } catch (err) {
      console.error("Fetching data failed:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        // Data
        users,
        setUsers,
        tutors,
        setTutors,
        students,
        setStudents,
        reviews,
        setReviews,
        attendance,
        setAttendance,
        locations,
        setLocations,
        subjects,
        setSubjects,
        schedules,
        setSchedules,

        // State
        loading,
        setLoading,
        error,
        setError,
        stats,
        setStats,

        // Modal state for AdminDashboard
        showModal,
        setShowModal,
        modalType,
        setModalType,
        selectedItem,
        setSelectedItem,
        formData,
        setFormData,

        // Functions
        loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export default AppProvider;
