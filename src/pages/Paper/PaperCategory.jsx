import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Category as CategoryIcon,
  AccountTree as TreeIcon,
  FolderOpen as FolderOpenIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../api';

// Validation schema
const categorySchema = yup.object().shape({
  name: yup
    .string()
    .required('Category name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  parent_id: yup
    .number()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
});

const gradientButtonStyle = {
  background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
  color: '#fff',
  fontWeight: 600,
  paddingX: 2,
  paddingY: 1,
  borderRadius: 2,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
    opacity: 0.9,
  }
};

const PaperCategory = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // For parent dropdown
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      parent_id: null
    }
  });

  // Flatten tree to get all categories for dropdown
  const flattenTree = (nodes, result = []) => {
    nodes.forEach(node => {
      result.push({ id: node.id, name: node.name, parent_id: node.parent_id });
      if (node.all_children && node.all_children.length > 0) {
        flattenTree(node.all_children, result);
      }
    });
    return result;
  };

  // Fetch root categories - using paper API endpoints
  const fetchCategories = async (parentId = null) => {
    setLoading(true);
    try {
      const url = parentId 
        ? `admin/paper/categories?parent_id=${parentId}`
        : 'admin/paper/categories';
      const response = await api.get(url);
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category tree - using paper API endpoints
  const fetchCategoryTree = async () => {
    setLoading(true);
    try {
      const response = await api.get('admin/paper/category-tree');
      const treeData = response.data.data || [];
      console.log(treeData);
      setCategoryTree(treeData);
      
      // Flatten tree for parent dropdown
      const flattened = flattenTree(treeData);
      setAllCategories(flattened);
    } catch (error) {
      toast.error('Failed to fetch category tree');
      console.error('Error fetching category tree:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create or update category - using paper API endpoints
  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        parent_id: data.parent_id || null
      };

      if (editingCategory) {
        await api.put(`admin/paper/category/${editingCategory.id}`, payload);
        toast.success('Category updated successfully');
      } else {
        await api.post('admin/paper/category', payload);
        toast.success('Category created successfully');
      }

      setOpenDialog(false);
      setEditingCategory(null);
      reset();
      
      // Refresh data based on current tab
      if (tabValue === 0) {
        fetchCategories(selectedParentId);
      } else {
        fetchCategoryTree();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
      console.error('Error saving category:', error);
    }
  };

  // Delete category - using paper API endpoints
  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await api.delete(`admin/paper/category/${categoryId}`);
      toast.success('Category deleted successfully');
      
      // Refresh data based on current tab
      if (tabValue === 0) {
        fetchCategories(selectedParentId);
      } else {
        fetchCategoryTree();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', error);
    }
  };

  // Open dialog for editing
  const handleEdit = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      parent_id: category.parent_id
    });
    setOpenDialog(true);
  };

  // Open dialog for creating new category
  const handleCreate = () => {
    setEditingCategory(null);
    reset({
      name: '',
      parent_id: selectedParentId
    });
    setOpenDialog(true);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      fetchCategories();
    } else {
      fetchCategoryTree();
    }
  };

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Render tree items recursively with improved styling
  const renderTreeItems = (nodes, level = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.all_children && node.all_children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      
      return (
        <React.Fragment key={node.id}>
          <ListItem
            sx={{
              pl: level * 4 + 2,
              py: 1,
              borderLeft: level > 0 ? '2px solid #e0e0e0' : 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleEdit(node)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleDelete(node.id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          >
            <ListItemButton
              onClick={() => hasChildren && toggleNode(node.id)}
              sx={{ flex: 1 }}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ExpandMoreIcon sx={{ mr: 1, color: 'primary.main' }} />
                ) : (
                  <ChevronRightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                )
              ) : (
                <Box sx={{ width: 24, mr: 1 }} />
              )}
              {isExpanded ? (
                <FolderOpenIcon sx={{ mr: 1, color: 'primary.main' }} />
              ) : (
                <FolderIcon sx={{ mr: 1, color: 'text.secondary' }} />
              )}
              <ListItemText
                primary={node.name}
                secondary={`ID: ${node.id}${node.parent_id ? ` | Parent: ${node.parent_id}` : ' | Root'}`}
              />
            </ListItemButton>
          </ListItem>
          {hasChildren && isExpanded && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderTreeItems(node.all_children, level + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchCategories();
    } else {
      fetchCategoryTree();
    }
  }, [tabValue]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            <CategoryIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#263238', mb: 0.5 }}>
              Paper Categories
            </Typography>
            <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '14px' }}>
              Manage paper categories and their hierarchical structure
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon />
                  Category List
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TreeIcon />
                  Category Tree
                </Box>
              }
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Parent</InputLabel>
                  <Select
                    value={selectedParentId || ''}
                    label="Filter by Parent"
                    onChange={(e) => {
                      const parentId = e.target.value || null;
                      setSelectedParentId(parentId);
                      fetchCategories(parentId);
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {allCategories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreate}
                  sx={gradientButtonStyle}
                >
                  Add Category
                </Button>
              </Box>

              {loading ? (
                <Box>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No categories found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((category) => (
                          <TableRow key={category.id} hover>
                            <TableCell>{category.id}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{category.name}</TableCell>
                            <TableCell>
                              {category.parent_id ? (
                                <Chip label={`Parent ID: ${category.parent_id}`} size="small" />
                              ) : (
                                <Chip label="Root" color="primary" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={category.status === 2 ? 'Active' : 'Inactive'}
                                color={category.status === 2 ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(category)}
                                sx={{ color: 'primary.main', mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(category.id)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreate}
                  sx={gradientButtonStyle}
                >
                  Add Category
                </Button>
              </Box>

              {loading ? (
                <Box>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
                  ))}
                </Box>
              ) : (
                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <List>
                    {categoryTree.length === 0 ? (
                      <ListItem>
                        <ListItemText
                          primary="No categories found"
                          secondary="Create your first category to get started"
                        />
                      </ListItem>
                    ) : (
                      renderTreeItems(categoryTree)
                    )}
                  </List>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2
        }}>
          {editingCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Category Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="parent_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Parent Category (Optional)</InputLabel>
                      <Select
                        {...field}
                        label="Parent Category (Optional)"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      >
                        <MenuItem value="">None (Root Category)</MenuItem>
                        {allCategories
                          .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                          .map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            sx={gradientButtonStyle}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaperCategory;










