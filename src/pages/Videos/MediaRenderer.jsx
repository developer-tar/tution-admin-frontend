import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  IconButton, 
  Tooltip, 
  Fade, 
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from "@mui/material";
import {
  PlayArrow,
  PictureAsPdf,
  Image,
  VideoLibrary,
  Download,
  Fullscreen,
  Close,
  Warning
} from "@mui/icons-material";
import { useState } from "react";
import React from "react";
import CommonLoader from "../../components/CommonLoader";
const MediaRenderer = ({ data, loading }) => {
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handleFullscreen = (media) => {
    setFullscreenMedia(media);
    setFullscreenOpen(true);
  };

  const handleCloseFullscreen = () => {
    setFullscreenOpen(false);
    setFullscreenMedia(null);
  };

  const handleOpenMediaViewer = (media) => {
    setSelectedMedia(media);
    setMediaViewerOpen(true);
  };

  const handleCloseMediaViewer = () => {
    setMediaViewerOpen(false);
    setSelectedMedia(null);
  };

  if (loading) {
    return (
      <Card sx={{
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <CommonLoader height={400}/>
        </CardContent>
      </Card>
    );
  }

  const mediaList = [
    ...(data?.topic_media || []),
    ...(data?.sub_topic_media || [])
  ];

  const getMediaIcon = (type) => {
    if (type?.startsWith("video/")) return VideoLibrary;
    if (type?.startsWith("image/")) return Image;
    if (type === "application/pdf") return PictureAsPdf;
    return Warning;
  };

  const getMediaColor = (type) => {
    if (type?.startsWith("video/")) return "#e91e63";
    if (type?.startsWith("image/")) return "#2196f3";
    if (type === "application/pdf") return "#ff9800";
    return "#9e9e9e";
  };

  const getMediaTypeName = (type) => {
    if (type?.startsWith("video/")) return "Video";
    if (type?.startsWith("image/")) return "Image";
    if (type === "application/pdf") return "PDF Document";
    return "Unknown";
  };

  if (mediaList.length === 0) {
    return (
      <Card sx={{
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
          }}>
            <VideoLibrary sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2c3e50' }}>
            No Media Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No media files have been uploaded for this topic yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              background: 'rgba(255,255,255,0.2)',
              width: 40,
              height: 40
            }}>
              <VideoLibrary sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                📱 Course Media Content
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {mediaList.length} media files available
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Media Content */}
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {mediaList.map((media, index) => {
              const type = media.type?.trim();
              const MediaIcon = getMediaIcon(type);
              const mediaColor = getMediaColor(type);
              const mediaTypeName = getMediaTypeName(type);

              return (
                <Fade in timeout={300 + index * 100} key={index}>
                  <Card sx={{
                    m: 2,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: `2px solid ${mediaColor}20`
                  }}>
                    {/* Media Header */}
                    <Box sx={{
                      background: `linear-gradient(135deg, ${mediaColor}15, ${mediaColor}05)`,
                      p: 2,
                      borderBottom: `1px solid ${mediaColor}20`
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{
                            background: `linear-gradient(135deg, ${mediaColor}, ${mediaColor}dd)`,
                            width: 32,
                            height: 32
                          }}>
                            <MediaIcon sx={{ fontSize: 18, color: 'white' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                              {mediaTypeName} #{index + 1}
                            </Typography>
                            <Chip 
                              label={type} 
                              size="small" 
                              sx={{ 
                                background: `${mediaColor}20`,
                                color: mediaColor,
                                fontWeight: 600,
                                fontSize: '10px'
                              }} 
                            />
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Open in Frame" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenMediaViewer(media)}
                              sx={{
                                background: `${mediaColor}20`,
                                color: mediaColor,
                                '&:hover': {
                                  background: `${mediaColor}30`,
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Fullscreen sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Download" arrow>
                            <IconButton
                              size="small"
                              component="a"
                              href={media.url}
                              download
                              sx={{
                                background: `${mediaColor}20`,
                                color: mediaColor,
                                '&:hover': {
                                  background: `${mediaColor}30`,
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Download sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>

                    {/* Media Content */}
                    <Box sx={{ p: 2 }}>
                      {type?.startsWith("video/") && (
                        <Box sx={{ 
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#000',
                          position: 'relative'
                        }}>
                          <video 
                            width="100%" 
                            controls 
                            style={{ 
                              display: 'block',
                              maxHeight: '400px'
                            }}
                          >
                            <source src={media.url} type={type} />
                            Your browser does not support the video tag.
                          </video>
                        </Box>
                      )}

                      {type?.startsWith("image/") && (
                        <Box sx={{ 
                          textAlign: 'center',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleOpenMediaViewer(media)}
                        >
                          <img
                            src={media.url}
                            alt={`Media ${index + 1}`}
                            style={{ 
                              maxWidth: "100%", 
                              maxHeight: 400, 
                              objectFit: "contain",
                              borderRadius: '8px',
                              transition: 'transform 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                          />
                        </Box>
                      )}

                      {type === "application/pdf" && (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Avatar sx={{
                            width: 60,
                            height: 60,
                            mx: 'auto',
                            mb: 2,
                            background: `linear-gradient(135deg, ${mediaColor}, ${mediaColor}dd)`
                          }}>
                            <PictureAsPdf sx={{ fontSize: 30 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                            PDF Document
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<PictureAsPdf />}
                            onClick={() => handleOpenMediaViewer(media)}
                            sx={{
                              background: `linear-gradient(135deg, ${mediaColor}, ${mediaColor}dd)`,
                              color: 'white',
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 600,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${mediaColor}dd, ${mediaColor}bb)`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 20px ${mediaColor}40`
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Open PDF in Frame
                          </Button>
                        </Box>
                      )}

                      {!type?.startsWith("video/") && !type?.startsWith("image/") && type !== "application/pdf" && (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Avatar sx={{
                            width: 60,
                            height: 60,
                            mx: 'auto',
                            mb: 2,
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                          }}>
                            <Warning sx={{ fontSize: 30 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2c3e50' }}>
                            Document File
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Media type: {type}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              startIcon={<Fullscreen />}
                              onClick={() => handleOpenMediaViewer(media)}
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                                }
                              }}
                            >
                              Open in Frame
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Download />}
                              href={media.url}
                              download
                              sx={{
                                borderColor: '#ff6b6b',
                                color: '#ff6b6b',
                                '&:hover': {
                                  background: '#ff6b6b10',
                                  borderColor: '#ff6b6b'
                                }
                              }}
                            >
                              Download
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Fade>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Universal Media Viewer Dialog */}
      <Dialog
        open={mediaViewerOpen}
        onClose={handleCloseMediaViewer}
        maxWidth={false}
        fullScreen
        PaperProps={{
          sx: {
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'white',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              background: selectedMedia ? `linear-gradient(135deg, ${getMediaColor(selectedMedia.type)}, ${getMediaColor(selectedMedia.type)}dd)` : '#667eea',
              width: 32,
              height: 32
            }}>
              {selectedMedia && React.createElement(getMediaIcon(selectedMedia.type), { sx: { fontSize: 18, color: 'white' } })}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                📱 {selectedMedia ? getMediaTypeName(selectedMedia.type) : 'Media'} Viewer
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {selectedMedia?.type}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download" arrow>
              <IconButton
                component="a"
                href={selectedMedia?.url}
                download
                sx={{ 
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <Download />
              </IconButton>
            </Tooltip>
            
            <IconButton 
              onClick={handleCloseMediaViewer}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {selectedMedia && (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 2
            }}>
              {/* Video Frame */}
              {selectedMedia.type?.startsWith("video/") && (
                <video 
                  width="100%" 
                  height="100%"
                  controls 
                  autoPlay
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: '8px'
                  }}
                >
                  <source src={selectedMedia.url} type={selectedMedia.type} />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {/* Image Frame */}
              {selectedMedia.type?.startsWith("image/") && (
                <img
                  src={selectedMedia.url}
                  alt="Media viewer"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              )}
              
              {/* PDF Frame */}
              {selectedMedia.type === "application/pdf" && (
                <iframe
                  src={selectedMedia.url}
                  width="100%"
                  height="100%"
                  style={{
                    border: 'none',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                  title="PDF Viewer"
                />
              )}
              
              {/* Other Document Types Frame */}
              {!selectedMedia.type?.startsWith("video/") && 
               !selectedMedia.type?.startsWith("image/") && 
               selectedMedia.type !== "application/pdf" && (
                <Box sx={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <iframe
                    src={selectedMedia.url}
                    width="100%"
                    height="100%"
                    style={{
                      border: 'none',
                      borderRadius: '8px',
                      background: 'white',
                      flex: 1
                    }}
                    title="Document Viewer"
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaRenderer;
