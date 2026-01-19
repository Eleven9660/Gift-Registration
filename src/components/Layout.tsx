import React from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { signOut, user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Declare Gift', path: '/declare' },
    { label: 'History', path: '/history' },
    { label: 'Review Queue', path: '/admin' }, // TODO: Hide based on role
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 4, display: { xs: 'none', md: 'flex' }, fontWeight: 'bold', color: 'primary.main', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              GiftReg
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {navItems.map((item) => (
                  <MenuItem key={item.path} onClick={() => { navigate(item.path); handleClose(); }}>
                    <Typography textAlign="center">{item.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{ my: 2, color: location.pathname === item.path ? 'primary.main' : 'text.secondary', display: 'block' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {user?.signInDetails?.loginId || user?.username}
                </Typography>
                <Button variant="outlined" size="small" onClick={signOut}>Sign Out</Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
