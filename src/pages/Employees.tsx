import { useEffect, useState } from "react";
import api from "../services/api";

const Employees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEmployee, setEditEmployee] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/auth/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE
  const deleteEmployee = async (id: string) => {
    try {
      await api.delete(`/auth/employee/${id}`);
      alert("Employee deleted");
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 EDIT OPEN
  const handleEdit = (emp: any) => {
    setEditEmployee(emp);
  };

  // 🔥 UPDATE
  const updateEmployee = async () => {
    try {
      await api.put(`/auth/employee/${editEmployee._id}`, {
        name: editEmployee.name,
        role: editEmployee.role,
      });

      alert("Employee updated");
      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>

      {loading && <p>Loading...</p>}

      {!loading && employees.length === 0 && (
        <p>No employees found ❌</p>
      )}

      {!loading && employees.length > 0 && (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Employee ID</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp: any) => (
              <tr key={emp._id} className="text-center border-t">
                <td className="p-2">{emp.name}</td>
                <td className="p-2">{emp.email}</td>
                <td className="p-2">{emp.employeeId}</td>
                <td className="p-2">{emp.role}</td>

                {/* 🔥 ACTION BUTTONS */}
                <td className="p-2">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(emp)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteEmployee(emp._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔥 EDIT SECTION */}
      {editEmployee && (
        <div className="mt-4 p-4 border">
          <h3>Edit Employee</h3>

          <input
            className="form-control mb-2"
            value={editEmployee.name}
            onChange={(e) =>
              setEditEmployee({ ...editEmployee, name: e.target.value })
            }
          />

          <select
            className="form-control mb-2"
            value={editEmployee.role}
            onChange={(e) =>
              setEditEmployee({ ...editEmployee, role: e.target.value })
            }
          >
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>

          <button className="btn btn-success me-2" onClick={updateEmployee}>
            Save
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setEditEmployee(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Employees;