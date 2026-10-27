import "ap-ds-storybook/build/all-combinations/css/variables.css";

export default function ApLayout({ children }) {
  return (
    <div data-theme="core" data-viewport="desktop">
      {children}
    </div>
  );
}
