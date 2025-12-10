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

const MockExamCategory = () => {
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

  // Fetch root categories
  const fetchCategories = async (parentId = null) => {
    setLoading(true);
    try {
      const url = parentId 
        ? `admin/mock-exam/categories?parent_id=${parentId}`
        : 'admin/mock-exam/categories';
      const response = await api.get(url);
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category tree
  const fetchCategoryTree = async () => {
    setLoading(true);
    try {
      const response = await api.get('admin/mock-exam/category-tree');
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

  // Create or update category
  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        parent_id: data.parent_id || null
      };

      if (editingCategory) {
        await api.put(`admin/mock-exam/category/${editingCategory.id}`, payload);
        toast.success('Category updated successfully');
      } else {
        await api.post('admin/mock-exam/category', payload);
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

  // Delete category
  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await api.delete(`admin/mock-exam/category/${categoryId}`);
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
    // Color coding based on level
    const levelColors = [
      '#1976d2', // Root - Blue
      '#2e7d32', // Level 1 - Green
      '#ed6c02', // Level 2 - Orange
      '#9c27b0', // Level 3 - Purple
    ];

    return nodes.map((node) => {
      const hasChildren = node.all_children && node.all_children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      const nodeColor = levelColors[Math.min(level, levelColors.length - 1)];

      return (
        <Box key={node.id}>
          <ListItem
            sx={{
              pl: level * 4 + 2,
              py: 1,
              borderLeft: level > 0 ? `3px solid ${nodeColor}30` : 'none',
              ml: level > 0 ? 2 : 0,
              mb: 0.5,
              borderRadius: 1,
              backgroundColor: `${nodeColor}08`,
              transition: 'all 0.2s',
              '&:hover': { 
                backgroundColor: `${nodeColor}15`,
                borderLeftColor: `${nodeColor}80`
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={() => toggleNode(node.id)}
                  sx={{ 
                    color: nodeColor,
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              ) : (
                <Box sx={{ width: 40 }} />
              )}
              
              {/* Folder/Category Icon */}
              {hasChildren ? (
                isExpanded ? 
                  <FolderOpenIcon sx={{ color: nodeColor, fontSize: 24 }} /> :
                  <FolderIcon sx={{ color: nodeColor, fontSize: 24 }} />
              ) : (
                <CategoryIcon sx={{ color: nodeColor, fontSize: 22 }} />
              )}
              
              {/* Category Name */}
              <Typography 
                variant="body1" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: level === 0 ? 600 : 500,
                  color: level === 0 ? '#000' : '#333'
                }}
              >
                {node.name}
              </Typography>
              
              {/* Children Count Badge */}
              {hasChildren && (
                <Chip 
                  label={`${node.all_children.length} ${node.all_children.length === 1 ? 'child' : 'children'}`}
                  size="small" 
                  sx={{ 
                    backgroundColor: `${nodeColor}20`,
                    color: nodeColor,
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              )}
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(node)}
                  sx={{ 
                    color: '#1976d2',
                    '&:hover': { backgroundColor: '#1976d220' }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(node.id)}
                  sx={{ 
                    color: '#d32f2f',
                    '&:hover': { backgroundColor: '#d32f2f20' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </ListItem>
          
          {/* Children */}
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ position: 'relative' }}>
                {renderTreeItems(node.all_children, level + 1)}
              </Box>
            </Collapse>
          )}
        </Box>
      );
    });
  };

  // Load initial data
  useEffect(() => {
    fetchCategories();
    fetchCategoryTree();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3} fontWeight={700}>
       Categories
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="List View" />
          <Tab label="Tree View" />
        </Tabs>
      </Box>

      {/* Tab Panel 0 - List View */}
      {tabValue === 0 && (
        <Box>
          {/* Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Parent</InputLabel>
              <Select
                value={selectedParentId || ''}
                onChange={(e) => {
                  const parentId = e.target.value || null;
                  setSelectedParentId(parentId);
                  fetchCategories(parentId);
                }}
                label="Filter by Parent"
              >
                <MenuItem value="">All Root Categories</MenuItem>
                {categories.map((cat) => (
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

          {/* Categories Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Parent</strong></TableCell>
                    <TableCell><strong>Children Count</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton width={30} /></TableCell>
                        <TableCell><Skeleton width={150} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={50} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                      </TableRow>
                    ))
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography>No categories found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          {category.parent_name ? (
                            <Chip label={category.parent_name} size="small" />
                          ) : (
                            <Chip label="Root" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={category.children_count || 0} 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(category)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(category.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Tab Panel 1 - Tree View */}
      {tabValue === 1 && (
        <Box>
          {/* Legend */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                icon={<FolderIcon />} 
                label="Root Level" 
                size="small" 
                sx={{ backgroundColor: '#1976d220', color: '#1976d2' }}
              />
              <Chip 
                icon={<FolderIcon />} 
                label="Level 1" 
                size="small" 
                sx={{ backgroundColor: '#2e7d3220', color: '#2e7d32' }}
              />
              <Chip 
                icon={<FolderIcon />} 
                label="Level 2" 
                size="small" 
                sx={{ backgroundColor: '#ed6c0220', color: '#ed6c02' }}
              />
              <Chip 
                icon={<CategoryIcon />} 
                label="Level 3+" 
                size="small" 
                sx={{ backgroundColor: '#9c27b020', color: '#9c27b0' }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={gradientButtonStyle}
            >
              Add Category
            </Button>
          </Box>

          <Paper sx={{ p: 2 }}>
            {loading ? (
              <Box>
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} height={50} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : categoryTree.length === 0 ? (
              <Typography align="center" color="textSecondary" py={4}>
                No categories found
              </Typography>
            ) : (
              <List sx={{ width: '100%', p: 0 }}>
                {renderTreeItems(categoryTree)}
              </List>
            )}
          </Paper>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
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
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="parent_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Parent Category (Optional)</InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        label="Parent Category (Optional)"
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={gradientButtonStyle}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MockExamCategory;