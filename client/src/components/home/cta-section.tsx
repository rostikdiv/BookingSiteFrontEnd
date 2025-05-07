export default function CTASection() {
  return (
      <section className="relative py-12 md:py-24 bg-primary-dark text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')"
            }}
            className="absolute inset-0 bg-cover bg-center"
        ></div>
      </section>
  );
}