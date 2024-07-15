import {Box, IconButton, Menu, MenuItem, Typography} from "@mui/material";
import {
    Brightness4 as Brightness4Icon,
    BrightnessHigh as BrightnessHighIcon,
    FormatSize,
    Help as HelpIcon, Language, Menu as MenuIcon
} from "@mui/icons-material";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import {useTheme as useAppTheme} from "material-ui-shell/lib/providers/Theme";
import {SET_MENU} from "../../reducer/actions/setting";
import {useDispatch} from "react-redux";
import {useIntl} from "react-intl";
import LanguageMenu from "./LanguageMenu";
import FontSizeMenu from "./FontSizeMenu";
import LayoutMenu from "./LayoutMenu";
import {useState} from "react";

export default function ({layoutItems,layoutItemsOnChange=()=>{}}){
    const intl = useIntl();
    const dispatch = useDispatch();
    const { toggleThisTheme, isDarkMode } = useAppTheme()
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return <>
        <img src={require('../../assets/logo.png')} loading="lazy" style={{height:'auto',width:150}}></img>
        <span style={{marginRight:5}}>v{process.env.REACT_APP_DATA_APP_VERSION}</span>
        <IconButton title={"About us"} size={"small"} sx={{transform:"translate(-10px,10px)"}}
        onClick={()=>dispatch({ type: SET_MENU, opened: true })}>
            <HelpIcon fontSize="inherit"/>
        </IconButton>
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
            >
                <MenuIcon />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                    display: { xs: 'block', md: 'none' },
                }}
            >

                <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">
                        <IconButton
                            title={"Toggle theme"}
                            onClick={() => {
                                toggleThisTheme('isDarkMode')
                            }}
                        >
                            {isDarkMode ? (
                                <BrightnessHighIcon/>
                            ) : (
                                <Brightness4Icon/>
                            )}
                        </IconButton>
                        {isDarkMode ? (
                            <>Light Mode</>
                        ) : (
                            <>Dark Mode</>
                        )}
                    </Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">
                        <LayoutMenu intl={intl} layoutItems={layoutItems} onChange={layoutItemsOnChange}/>
                        Layout
                    </Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">
                        <FontSizeMenu intl={intl}/>
                        Font size
                    </Typography>
                </MenuItem><MenuItem onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">
                        <LanguageMenu intl={intl}/>
                    </Typography>
                </MenuItem>
            </Menu>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <IconButton
                title={"Toggle theme"}
                onClick={() => {
                    toggleThisTheme('isDarkMode')
                }}
            >
                {isDarkMode ? (
                    <BrightnessHighIcon/>
                ) : (
                    <Brightness4Icon/>
                )}
            </IconButton>
            {/*layoutItems*/}
            <LayoutMenu intl={intl} layoutItems={layoutItems} onChange={layoutItemsOnChange}/>
            <FontSizeMenu intl={intl}/>
            <LanguageMenu intl={intl}/>
        </Box>
    </>
}