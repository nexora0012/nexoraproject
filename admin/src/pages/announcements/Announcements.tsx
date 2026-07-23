import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import {
  getAnnouncements,
  deleteAnnouncement,
} from "../../services/announcementService";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  status: boolean;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnnouncements = async () => {
    try {
      const response = await getAnnouncements();
      setAnnouncements(response.announcements || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      await deleteAnnouncement(id);
      loadAnnouncements();
    } catch (error) {
      console.error(error);
      alert("Failed to delete announcement");
    }
  };

  return (
    <AdminLayout>
      <h1>Announcements</h1>

      <div style={{ margin: "20px 0" }}>
        <Link to="/announcements/add">
          <button>Add Announcement</button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="plan-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement._id}>
                <td>{announcement.title}</td>
                <td>{announcement.message}</td>
                <td>{announcement.status ? "Active" : "Inactive"}</td>
                <td>
                  <Link
                    to="/announcements/edit"
                    state={announcement}
                  >
                    <button>Edit</button>
                  </Link>

                  <button
                    onClick={() => handleDelete(announcement._id)}
                    style={{ marginLeft: 10 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}