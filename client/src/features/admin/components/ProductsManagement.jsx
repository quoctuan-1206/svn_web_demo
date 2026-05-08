import { useState, useEffect } from "react";
import "./AdminTable.css";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
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
      const url = editingId ? `/api/products/${editingId}` : "/api/products";

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

      setFormData({ title: "", description: "", image: "", category: "" });
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError("Lỗi: " + err.message);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Lỗi khi xóa");
      fetchProducts();
    } catch (err) {
      setError("Lỗi: " + err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", description: "", image: "", category: "" });
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Quản lý Sản phẩm</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) handleCancel();
          }}
          className="add-btn"
        >
          {showForm ? "Hủy" : "+ Thêm sản phẩm"}
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tên sản phẩm:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Danh mục:</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
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
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.title}</td>
                <td>{product.category}</td>
                <td>{product.description.substring(0, 50)}...</td>
                <td>
                  <button
                    onClick={() => handleEdit(product)}
                    className="edit-btn"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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

export default ProductsManagement;
