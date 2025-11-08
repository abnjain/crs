import api from "@/config/api";

/**
 * User Service — Handles all user-related API calls
 */
export const userService = {
  /**
   * Get currently authenticated user's details
   * @returns {Promise<Object>}
   */
  getUser: async () => {
    return await api.get("/auth/users/me");
  },

  /**
   * Update the currently authenticated user's profile
   * @param {Object} data - Fields to update (e.g. name, email, bio, etc.)
   * @returns {Promise<Object>}
   */
  updateUser: async (data) => {
    return await api.patch("/auth/users/me", data);
  },

  /**
   * Fetch a specific user by ID
   * @param {String} id - User ID
   * @returns {Promise<Object>}
   */
  getUserById: async (id) => {
    return await api.get(`/auth/users/${id}`);
  },

  /**
   * Update user roles (Admin/SuperAdmin only)
   * @param {String} id - User ID
   * @param {Array|String} roles - Roles to assign
   * @returns {Promise<Object>}
   */
  updateRoles: async (id, roles) => {
    return await api.patch(`/auth/users/${id}/roles`, { roles });
  },

  /**
   * List all users (Admin/SuperAdmin only)
   * @returns {Promise<Array>}
   */
  listUsers: async () => {
    return await api.get("/auth/users");
  },

  /**
   * Revoke all tokens (Admin/SuperAdmin only)
   * @returns {Promise<Object>}
   */
  revokeAllTokens: async () => {
    return await api.post("/auth/revoke-all");
  },
};
