from collections import defaultdict
from .models import Priority

class Graph:
    def __init__(self, vertices):
        self.V = vertices
        self.edges = defaultdict(list)  # Contains tuples of (destination, capacity, flow, reverse edge index)
        self.costs = {}  # Cost for each directed edge

    def add_edge(self, u, v, cap, cost):
        self.edges[u].append((v, cap, 0, len(self.edges[v])))  # Forward edge
        self.edges[v].append((u, 0, 0, len(self.edges[u]) - 1))  # Reverse edge for flow adjustment
        self.costs[(u, v)] = cost
        self.costs[(v, u)] = -cost  # Cost for reverse edge, assuming negative for flow reversal

    def bellman_ford(self, source):
        dist = [float('inf')] * self.V
        dist[source] = 0
        parent = [-1] * self.V
        for _ in range(self.V - 1):
            for u in range(self.V):
                for i, (v, cap, flow, _) in enumerate(self.edges[u]):
                    if cap > flow and dist[u] + self.costs[(u, v)] < dist[v]:
                        dist[v] = dist[u] + self.costs[(u, v)]
                        parent[v] = (u, i)
        return parent

    def min_cost_max_flow(self, source, sink):
        max_flow = 0
        min_cost = 0
        while True:
            parent = self.bellman_ford(source)
            if parent[sink] == -1:  # No augmenting path exists
                break

            # Find minimum residual capacity of the augmenting path
            path_flow = float('inf')
            s = sink
            while s != source:
                u, i = parent[s]
                v, cap, flow, _ = self.edges[u][i]
                path_flow = min(path_flow, cap - flow)
                s = u

            # Update flow and costs along the path
            max_flow += path_flow
            s = sink
            while s != source:
                u, i = parent[s]
                v, cap, flow, rev = self.edges[u][i]
                self.edges[u][i] = (v, cap, flow + path_flow, rev)  # Update forward edge flow
                rv, rcap, rflow, _ = self.edges[v][rev]
                self.edges[v][rev] = (rv, rcap, rflow - path_flow, i)  # Update reverse edge flow
                min_cost += self.costs[(u, v)]
                s = u

        return max_flow

    def get_matching(self, slots, responses):
        n_invitee = len(responses)
        matching = {}
        leftovers = set()
        for u in range(self.V):
            for v, cap, flow, _ in self.edges[u]:
                if u != 0 and v != self.V - 1 and flow == cap and cap > 0:  # Ensure we're looking at original edges only
                    matching[responses[u - 1][0]] = slots[v - n_invitee - 1][0]
        for response in responses:
            if response[0] not in matching:
                leftovers.add(response[0])
        return matching, leftovers

def suggest_schedule(slots, responses, priority):
    n_invitee = len(responses)
    n_slot = len(slots)
    n_node = n_invitee + n_slot + 2
    source, sink = 0, n_node - 1
    graph = Graph(n_node)

    for invitee_index in range(n_invitee):
        graph.add_edge(0, invitee_index + 1, 1, 0)
        order_cost = 1 - 1 / (invitee_index + 1)
        if priority == Priority.INVITEE_ORDER:
            priority_cost = 1 / (n_invitee ** 2)
        else:
            priority_cost = 1
        for slot_index in responses[invitee_index][2]:
            graph.add_edge(invitee_index + 1, slot_index + n_invitee + 1, 1, order_cost)
        for slot_index in responses[invitee_index][1]:
            graph.add_edge(invitee_index + 1, slot_index + n_invitee + 1, 1, order_cost + priority_cost)


    for slot_index in range(n_slot):
        priority_cost = 1 - slots[slot_index][1]
        graph.add_edge(slot_index + n_invitee + 1, n_invitee + n_slot + 1, 1, priority_cost)

    max_flow = graph.min_cost_max_flow(source, sink)
    matching, leftover = graph.get_matching(slots, responses)
    return max_flow, matching, leftover