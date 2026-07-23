import axiosClient from './axiosClient';

const recipeApi = {
    getRecipes: (params) => axiosClient.get('/admin/recipes', { params }),
    getRecipeById: (id) => axiosClient.get(`/admin/recipes/${id}`),
    createRecipe: (data) => axiosClient.post('/admin/recipes', data),
    updateRecipe: (id, data) => axiosClient.put(`/admin/recipes/${id}`, data),
    deleteRecipe: (id) => axiosClient.delete(`/admin/recipes/${id}`),
    
    getAvailableMenuItems: () => axiosClient.get('/admin/recipes/available-menu-items'),
    getIngredients: () => axiosClient.get('/admin/recipes/ingredients')
};

export default recipeApi;