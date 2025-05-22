interface IButton {
  onClick?: () => void;
  type?: "button" | "submit" | "reset" | undefined;
  icon?: React.ReactNode;
  text: string;
}
export const Button = ({ onClick, type = "button", icon, text }: IButton) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
    >
      {icon && icon}
      {text}
    </button>
  );
};
