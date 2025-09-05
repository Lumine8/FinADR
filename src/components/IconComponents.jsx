import React from 'react';
import { FaUserAstronaut, FaPiggyBank, FaCoffee, FaPizzaSlice, FaUserCircle, FaTrophy, FaSignOutAlt, FaMoon, FaSun, FaFileExport } from "react-icons/fa";
import { GiWaterDrop, GiTreasureMap, GiPartyPopper, GiAlarmClock } from "react-icons/gi";
import { MdOutlineSavings, MdCheckCircle } from "react-icons/md";
import { BsTrophy, BsPeopleFill } from "react-icons/bs";
import { TbTargetArrow } from "react-icons/tb";
import { IoFlash } from "react-icons/io5";
import { FaHamburger, FaCar, FaShoppingBag, FaFileInvoiceDollar, FaFilm, FaEllipsisH } from "react-icons/fa";
import { FiPlus, FiLogOut, FiUser, FiUsers, FiX, FiTarget, FiHome, FiMenu } from "react-icons/fi";
import { FaEdit, FaTrash, FaAward, FaBrain } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import { HiCollection } from "react-icons/hi";
import { RiShieldCheckLine } from "react-icons/ri";
import { BiGitBranch } from "react-icons/bi";

export const IconComponents = {
    PlusIcon: () => <FiPlus className="icon" />,
    EditIcon: () => <FaEdit className="icon-sm" />,
    DeleteIcon: () => <FaTrash className="icon-sm" />,
    SparklesIcon: () => <MdAutoAwesome className="icon-sm sparkles-icon" />,
    LogoutIcon: () => <FiLogOut className="icon" />,
    UserIcon: () => <FiUser className="icon" />,
    UsersIcon: () => <FiUsers className="icon" />,
    CloseIcon: () => <FiX className="icon" />,
    SplitIcon: () => <BiGitBranch className="icon-sm" />,
    CollectionIcon: () => <HiCollection className="icon" />,
    BrainIcon: () => <FaBrain className="feature-icon" />,
    ShieldCheckIcon: () => <RiShieldCheckLine className="feature-icon" />,
    TargetIcon: () => <FiTarget className="icon" />,
    TrophyIcon: () => <FaTrophy className="icon" />,
    HomeIcon: () => <FiHome className="icon" />,
    MenuIcon: () => <FiMenu className="icon" />,
    AwardIcon: () => <FaAward className="icon" />
};
