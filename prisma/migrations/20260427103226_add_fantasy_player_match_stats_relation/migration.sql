-- AddForeignKey
ALTER TABLE "FantasyPlayerMatchStats" ADD CONSTRAINT "FantasyPlayerMatchStats_fantasyPlayerId_fkey" FOREIGN KEY ("fantasyPlayerId") REFERENCES "FantasyPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
