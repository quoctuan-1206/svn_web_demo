import { useState, useEffect } from "react";
import "./AdminTable.css";

const NewsManagement = () => {
  const [newsList, setNewsList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news");
      const data = await response.json();
      setNewsList(data);
    } catch (err) {
      setError("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");

    try {
      const url = editingId ? `/api/news/${editingId}` : "/api/news";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Lỗi khi lưu");

      setFormData({
        title: "",
        content: "",
        image: "",
        date: new Date().toISOString().split("T")[0],
      });
      setEditingId(null);
      setShowForm(false);
      fetchNews();
    } catch (err) {
      setError("Lỗi: " + err.message);
    }
  };

  const handleEdit = (news) => {
    setFormData(news);
    setEditingId(news.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Lỗi khi xóa");
      fetchNews();
    } catch (err) {
      setError("Lỗi: " + err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      image: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Quản lý Tin tức</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) handleCancel();
          }}
          className="add-btn"
        >
          {showForm ? "Hủy" : "+ Thêm tin tức"}
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tiêu đề:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ngày đăng:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nội dung:</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Link ảnh:</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              {editingId ? "Cập nhật" : "Thêm mới"}
            </button>
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Ngày đăng</th>
              <th>Nội dung</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {newsList.map((news) => (
              <tr key={news.id}>
                <td>{news.id}</td>
                <td>{news.title}</td>
                <td>{news.date}</td>
                <td>{news.content.substring(0, 50)}...</td>
                <td>
                  <button onClick={() => handleEdit(news)} className="edit-btn">
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(news.id)}
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
    </div>
  );
};

export default NewsManagement;
