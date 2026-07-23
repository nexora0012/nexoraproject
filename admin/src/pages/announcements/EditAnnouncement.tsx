import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import {
  updateAnnouncement,
} from "../../services/announcementService";

export default function EditAnnouncement() {
  const navigate = useNavigate();
  const location = useLocation();

  const announcement = location.state;

  const [form, setForm] = useState({
    title: "",
    message: "",
    status: true,
  });

  useEffect(() => {
    if (announcement) {
      setForm({
        title: announcement.title,
        message: announcement.message,
        status: announcement.status,
      });
    }
  }, [announcement]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateAnnouncement(
        announcement._id,
        form
      );

      alert("Announcement Updated");

      navigate("/announcements");
    } catch (error) {
      console.error(error);

      alert("Unable to update announcement");
    }
  };

  return (
    <AdminLayout>
      <h1>Edit Announcement</h1>

      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
      />

      <br />
      <br />

      <textarea
        name="message"
        placeholder="Message"
        rows={6}
        value={form.message}
        onChange={handleChange}
      />

      <br />
      <br />

      <button onClick={handleSubmit}>
        Update Announcement
      </button>
    </AdminLayout>
  );
}