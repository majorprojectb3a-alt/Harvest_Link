from .knowledge_blocks import get_market_stats

def build_context(commodity, market):

    stats = get_market_stats(commodity, market)

    if not stats:
        return "No historical context avaiable"
    
    blocks = []

    blocks.append(f"Recent modal price is {stats['last_price']:.0f}.")
    blocks.append(f"7-day average price is {stats['avg7']:.0f}.")
    blocks.append(f"30-day average price is {stats['avg30']:.0f}.")
    blocks.append(f"Price trend is {stats['trend']}.")
    blocks.append(f"Recent volatality is {stats['volatality']:.2f}.")

    return "\n".join(blocks)

