import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { CheckCircle, Server, Shield, Cloud, Zap } from 'lucide-react'

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            System Hostingowy z Autoskalowaniem
                        </h1>
                        <p className="text-xl mb-8">
                            Nowoczesny hosting z dynamicznym skalowaniem zasobów, zaprojektowany
                            dla Twojego biznesu. Zyskaj najlepszą wydajność w konkurencyjnej cenie.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                                <Link to="/hosting">Zobacz plany</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                                <Link to="/register">Rozpocznij za darmo</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Dlaczego warto wybrać nasz hosting?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Server className="w-10 h-10 text-blue-600" />}
                            title="Autoskalowanie"
                            description="Dynamiczne skalowanie zasobów w zależności od obciążenia. Płać tylko za to, czego naprawdę potrzebujesz."
                        />
                        <FeatureCard
                            icon={<Shield className="w-10 h-10 text-blue-600" />}
                            title="Bezpieczeństwo"
                            description="Zaawansowane zabezpieczenia oraz regularne kopie zapasowe. Twoje dane są zawsze bezpieczne."
                        />
                        <FeatureCard
                            icon={<Cloud className="w-10 h-10 text-blue-600" />}
                            title="Chmura"
                            description="Infrastruktura chmurowa zapewniająca najwyższą dostępność i niezawodność."
                        />
                        <FeatureCard
                            icon={<Zap className="w-10 h-10 text-blue-600" />}
                            title="Wydajność"
                            description="Najnowsze technologie i sprzęt gwarantujący najwyższą wydajność."
                        />
                        <FeatureCard
                            icon={<CheckCircle className="w-10 h-10 text-blue-600" />}
                            title="99.9% Uptime"
                            description="Gwarantujemy dostępność na poziomie 99.9%, wspieraną przez nasze SLA."
                        />
                        <FeatureCard
                            icon={<Zap className="w-10 h-10 text-blue-600" />}
                            title="Tryb EKO"
                            description="Oszczędzaj energię i środowisko dzięki naszemu trybowi EKO."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-700 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Gotowy na rozpoczęcie?</h2>
                    <p className="text-xl max-w-2xl mx-auto mb-8">
                        Dołącz do tysięcy zadowolonych klientów i wybierz hosting, który rośnie razem z Twoim biznesem.
                    </p>
                    <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                        <Link to="/register">Zarejestruj się teraz</Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

export default Home