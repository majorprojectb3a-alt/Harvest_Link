import './Navbar.css'
import { FaUserCircle} from "react-icons/fa";
import {FiLogOut} from "react-icons/fi"


function Navbar () {
    return (
        <nav className='nav'>
            <div className='logo'>HarvestLink</div>

            <div className='right'>

                <ul className="nav-links">
                    <li><a href="#home">Home</a></li>

                    <li><a href="#contact">Contact</a></li>
                </ul>
                <FaUserCircle className='profile'/>
                <div className='logout'>
                    <FiLogOut className="logout-logo" title="Logout"/>
                    <p>LogOut</p>
                </div>
                
            </div>

        </nav>
    );
}

export default Navbar;