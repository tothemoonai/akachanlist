import * as Icons from 'lucide-react';

interface ItemIconProps {
  icon?: string;
  className?: string;
}

// 图标名称到组件的映射（只使用 lucide-react 中存在的图标）
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  baby: Icons.Baby,
  shirt: Icons.Shirt,
  home: Icons.Home,
  book: Icons.Book,
  pill: Icons.Pill,
  bottle: Icons.Package, // 临时使用 Package
  thermometer: Icons.Thermometer,
  stethoscope: Icons.Activity, // 临时使用 Activity
  heart: Icons.Heart,
  package: Icons.Package,
  car: Icons.Car,
  shoppingBag: Icons.ShoppingBag,
  backpack: Icons.Backpack,
  clock: Icons.Clock,
  calendar: Icons.Calendar,
  syringe: Icons.Syringe,
  bed: Icons.Bed,
  lamp: Icons.Lightbulb,
  microwave: Icons.Microwave,
  // 默认图标
  default: Icons.Package,
};

export function ItemIcon({ icon, className = "w-8 h-8" }: ItemIconProps) {
  if (!icon) return null;

  // 如果 icon 以 '/' 或 'http' 开头，则认为是图片路径
  if (icon.startsWith('/') || icon.startsWith('http')) {
    return <img src={icon} alt="" className={className} />;
  }

  // 否则使用 lucide-react 图标
  const IconComponent = iconMap[icon] || iconMap.default;

  return <IconComponent className={className} />;
}
