import {
    Avatar,
    Dropdown,
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarLink,
    NavbarToggle,
} from "flowbite-react";
import { logoutUser } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

export default function Header() {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.currentUser);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/sign-in");
    };

    // Define avatar image based on currentUser presence
    const avatarImage = currentUser
        ? "/1.png" // You can replace with dynamic user image if available
        : "/2.png"; // default guest image

    return (
        <Navbar fluid className="h-20 p-4 dark:bg-lime-400 z-999">
            <NavbarBrand href="/" className="gap-2 pb-3">
                <img src="/FT_log.png" alt="" className="w-10 h-auto" />
                <span className="self-center whitespace-nowrap text-3xl font-semibold dark:text-black">FamTree</span>
            </NavbarBrand>
            <div className="flex md:order-2 m-1">
                <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                        <Avatar
                            alt="User settings"
                            img={avatarImage}
                            rounded
                        />
                    }
                    className="bg-black text-lime-400 border border-lime-400"
                >
                    <DropdownHeader className="text-white bg-black border-b border-lime-400">
                        <span className="block text-sm">{currentUser?.email || 'user@mail.com'}</span>
                        <span className="block truncate text-sm font-medium">{currentUser?.username || 'Guest'}</span>
                    </DropdownHeader>
                    {!currentUser && (
                        <>
                            <DropdownItem className="hover:bg-lime-500 hover:text-black" href="/sign-in">Sign In</DropdownItem>
                            <DropdownItem href="/sign-up">Sign Up</DropdownItem>
                            <DropdownDivider />
                        </>
                    )}
                    {currentUser && (
                        <>
                            <DropdownDivider />
                            <DropdownItem className="text-red-500 hover:bg-red-500 hover:text-white" onClick={handleLogout}>Sign out</DropdownItem>
                        </>
                    )}
                </Dropdown>
                <NavbarToggle />
            </div>
            <NavbarCollapse className="z-[9999] dark:bg-white md:bg-transparent rounded-lg shadow-md p-4">
                <NavbarLink href="/">
                    <div className="text-lg dark:text-black hover:bg-black hover:text-lime-400 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out">Home</div>
                </NavbarLink>
                <NavbarLink href="/about">
                    <div className="text-lg dark:text-black hover:bg-black hover:text-lime-400 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out">About</div>
                </NavbarLink>
            </NavbarCollapse>
        </Navbar>
    );
}
