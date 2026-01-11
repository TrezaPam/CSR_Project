const API_BASE_URL = "http://localhost:5000/api/routines";

// ==========================================
// STAKEHOLDER API CALLS
// ==========================================

export const getAllStakeholders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.branch) params.append("branch", filters.branch);
    if (filters.is_active !== undefined)
      params.append("is_active", filters.is_active);

    const response = await fetch(
      `${API_BASE_URL}/stakeholders?${params.toString()}`
    );
    if (!response.ok) throw new Error("Failed to fetch stakeholders");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stakeholders:", error);
    throw error;
  }
};

export const createStakeholder = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stakeholders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create stakeholder");
    return await response.json();
  } catch (error) {
    console.error("Error creating stakeholder:", error);
    throw error;
  }
};

export const updateStakeholder = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stakeholders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update stakeholder");
    return await response.json();
  } catch (error) {
    console.error("Error updating stakeholder:", error);
    throw error;
  }
};

export const deleteStakeholder = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stakeholders/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete stakeholder");
    return await response.json();
  } catch (error) {
    console.error("Error deleting stakeholder:", error);
    throw error;
  }
};

// ==========================================
// ROUTINE SCHEDULE API CALLS
// ==========================================

export const getAllRoutines = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.month) params.append("month", filters.month);
    if (filters.year) params.append("year", filters.year);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.stakeholder_id)
      params.append("stakeholder_id", filters.stakeholder_id);

    const response = await fetch(
      `${API_BASE_URL}/schedules?${params.toString()}`
    );
    if (!response.ok) throw new Error("Failed to fetch routines");
    return await response.json();
  } catch (error) {
    console.error("Error fetching routines:", error);
    throw error;
  }
};

export const getRoutinesByStakeholder = async (year) => {
  try {
    const params = new URLSearchParams();
    if (year) params.append("year", year);

    const response = await fetch(
      `${API_BASE_URL}/schedules/by-stakeholder?${params.toString()}`
    );
    if (!response.ok)
      throw new Error("Failed to fetch routines by stakeholder");
    return await response.json();
  } catch (error) {
    console.error("Error fetching routines by stakeholder:", error);
    throw error;
  }
};

export const createRoutine = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: "POST",
      body: formData, // FormData object, don't set Content-Type header
    });
    if (!response.ok) throw new Error("Failed to create routine");
    return await response.json();
  } catch (error) {
    console.error("Error creating routine:", error);
    throw error;
  }
};

export const updateRoutine = async (id, formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: "PUT",
      body: formData, // FormData object, don't set Content-Type header
    });
    if (!response.ok) throw new Error("Failed to update routine");
    return await response.json();
  } catch (error) {
    console.error("Error updating routine:", error);
    throw error;
  }
};

export const deleteRoutine = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete routine");
    return await response.json();
  } catch (error) {
    console.error("Error deleting routine:", error);
    throw error;
  }
};

export const generateMonthlySchedules = async (month, year) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    });
    if (!response.ok) throw new Error("Failed to generate schedules");
    return await response.json();
  } catch (error) {
    console.error("Error generating schedules:", error);
    throw error;
  }
};
