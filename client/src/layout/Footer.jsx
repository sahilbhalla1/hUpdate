const Footer = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  return (
    <footer className="text-gray-500 text-sm py-4 mt-auto">
      <div className="px-3 lg:px-6">
        <span>
          ©️ {year} All rights reserved: <strong className="font-semibold">Cogent E-Services Limited</strong>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
