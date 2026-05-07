import { useState, useEffect } from "react";
import "./AdminTable.css";

const ContactsManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts");
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa liên hệ này?")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Lỗi khi xóa");
      fetchContacts();
    } catch (err) {
      setError("Lỗi: " + err.message);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Quản lý Liên hệ</h2>
        <span className="contact-count">Tổng: {contacts.length} liên hệ</span>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Ngày liên hệ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{contact.date || "N/A"}</td>
                <td>
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === contact.id ? null : contact.id,
                      )
                    }
                    className="view-btn"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="delete-btn"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expandedId && (
        <div className="contact-detail">
          {contacts.map(
            (contact) =>
              contact.id === expandedId && (
                <div key={contact.id} className="detail-content">
                  <h3>Chi tiết liên hệ</h3>
                  <p>
                    <strong>Tên:</strong> {contact.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {contact.email}
                  </p>
                  <p>
                    <strong>Điện thoại:</strong> {contact.phone}
                  </p>
                  <p>
                    <strong>Công ty:</strong> {contact.company || "N/A"}
                  </p>
                  <p>
                    <strong>Tin nhắn:</strong>
                  </p>
                  <div className="message-box">{contact.message}</div>
                  <button
                    onClick={() => setExpandedId(null)}
                    className="close-btn"
                  >
                    Đóng
                  </button>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsManagement;
