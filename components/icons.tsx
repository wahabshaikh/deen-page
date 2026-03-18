"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Cancel01Icon,
  Menu01Icon,
  Logout01Icon,
  DashboardSquare01Icon,
  UserIcon,
  HeartAddIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  LinkSquare01Icon,
  GlobeIcon,
  SparklesIcon,
  GithubIcon,
  Briefcase01Icon,
  FolderOpenIcon,
  UserGroupIcon,
  Loading01Icon,
  CheckmarkCircle01Icon,
  Add01Icon,
  CheckmarkBadge01Icon,
  EyeIcon,
  Clock01Icon,
  SaveIcon,
  Delete01Icon,
  PencilIcon,
  ColorsIcon,
  Link01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  FolderAddIcon,
  Copy01Icon,
  Store01Icon,
  SmartphoneChargingIcon,
  ShieldBanIcon,
  UserAdd01Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";

type IconProps = { size?: number; className?: string; "aria-hidden"?: boolean };

const withIcon = (IconSvg: typeof Search01Icon, defaultSize = 24) => {
  const C = ({ size, className, "aria-hidden": ariaHidden }: IconProps) => (
    <HugeiconsIcon
      icon={IconSvg}
      size={size ?? defaultSize}
      color="currentColor"
      className={className}
      aria-hidden={ariaHidden}
    />
  );
  return C;
};

export const SearchIcon = withIcon(Search01Icon, 20);
export const CancelIcon = withIcon(Cancel01Icon, 16);
export const MenuIcon = withIcon(Menu01Icon, 20);
export const LogOutIcon = withIcon(Logout01Icon, 16);
export const DashboardIcon = withIcon(DashboardSquare01Icon, 16);
export const UserIconComponent = withIcon(UserIcon, 16);
export const HeartIcon = withIcon(HeartAddIcon, 14);
export const ArrowRightIcon = withIcon(ArrowRight01Icon, 14);
export const ArrowLeftIcon = withIcon(ArrowLeft01Icon, 16);
export const ExternalLinkIcon = withIcon(LinkSquare01Icon, 16);
export const GlobeIconComponent = withIcon(GlobeIcon, 22);
export const SparklesIconComponent = withIcon(SparklesIcon, 16);
export const GithubIconComponent = withIcon(GithubIcon, 16);
export const BriefcaseIcon = withIcon(Briefcase01Icon, 24);
export const FolderOpenIconComponent = withIcon(FolderOpenIcon, 24);
export const UsersIcon = withIcon(UserGroupIcon, 24);
export const LoaderIcon = withIcon(Loading01Icon, 32);
export const CheckCircleIcon = withIcon(CheckmarkCircle01Icon, 24);
export const PlusIcon = withIcon(Add01Icon, 24);
export const BadgeCheckIcon = withIcon(CheckmarkBadge01Icon, 16);
export const EyeIconComponent = withIcon(EyeIcon, 16);
export const ClockIcon = withIcon(Clock01Icon, 16);
export const SaveIconComponent = withIcon(SaveIcon, 16);
export const TrashIcon = withIcon(Delete01Icon, 16);
export const PencilIconComponent = withIcon(PencilIcon, 16);
export const PaletteIcon = withIcon(ColorsIcon, 16);
export const LinkIconComponent = withIcon(Link01Icon, 16);
export const ArrowDownIcon = withIcon(ArrowDown01Icon, 16);
export const ArrowUpIcon = withIcon(ArrowUp01Icon, 16);
export const FolderAddIconComponent = withIcon(FolderAddIcon, 16);
export const CopyIcon = withIcon(Copy01Icon, 16);
export const CheckIcon = withIcon(CheckmarkCircle01Icon, 16);
export const StoreIcon = withIcon(Store01Icon, 16);
export const SmartphoneIcon = withIcon(SmartphoneChargingIcon, 16);
export const ShieldXIcon = withIcon(ShieldBanIcon, 48);
export const UserPlusIcon = withIcon(UserAdd01Icon, 18);
export const XCircleIcon = withIcon(CancelCircleIcon, 14);
export const ChevronDownIcon = withIcon(ArrowDown01Icon, 18);
export const ChevronUpIcon = withIcon(ArrowUp01Icon, 18);
