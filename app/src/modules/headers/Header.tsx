import ChannelHeader from "./ChannelHeader";
import DashboardHeader from "./DashboardHeader";
import { useNavigation } from "../hooks/useNavigation";

export default function Header() {
  const nav = useNavigation();

  if (nav.isChannelRoute) {
    return <ChannelHeader className="w-full border-b border-border py-1 px-2 flex gap-2" />;
  }

  return <DashboardHeader className="w-full border-b border-border py-1 px-2 flex gap-2" />;
}
