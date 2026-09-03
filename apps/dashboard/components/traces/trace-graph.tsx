"use client";

import {
    Background,
    Controls,
    Handle,
    Position,
    ReactFlow,
    type Edge,
    type Node,
    type NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import type {
    TraceSpan,
    TraceTreeNode,
} from "@/types/trace-detail";

type TraceGraphProps = {
    roots: TraceTreeNode[];
};

type TerraxNodeData = {
    span: TraceSpan;
};

type TerraxNode = Node<TerraxNodeData>;

function formatDuration(durationMs: number): string {
    if (durationMs < 1000) {
        return `${Math.round(durationMs)}ms`;
    }

    return `${(durationMs / 1000).toFixed(2)}s`;
}

function formatTokens(tokens?: number): string {
    if (tokens === undefined) {
        return "—";
    }

    return tokens.toLocaleString();
}

function getTypeLabel(type: TraceSpan["type"]): string {
    switch (type) {
        case "workflow":
            return "WORKFLOW";
        case "workflow_node":
            return "NODE";
        case "llm":
            return "LLM";
        case "tool":
            return "TOOL";
        default:
            return "SPAN";
    }
}

function getTypeSymbol(type: TraceSpan["type"]): string {
    switch (type) {
        case "workflow":
            return "◆";
        case "workflow_node":
            return "◇";
        case "llm":
            return "◉";
        case "tool":
            return "⚒";
        default:
            return "○";
    }
}

function getTypeClasses(type: TraceSpan["type"]) {
    switch (type) {
        case "workflow":
            return {
                badge:
                    "bg-foreground text-background",
                icon:
                    "bg-foreground text-background",
                border:
                    "border-foreground/20",
            };


        case "workflow_node":
            return {
                badge:
                    "bg-muted text-foreground",
                icon:
                    "bg-muted text-foreground",
                border:
                    "border-border",
            };

        case "llm":
            return {
                badge:
                    "bg-primary/10 text-primary",
                icon:
                    "bg-primary/10 text-primary",
                border:
                    "border-primary/30",
            };

        case "tool":
            return {
                badge:
                    "bg-muted text-foreground",
                icon:
                    "bg-muted text-foreground",
                border:
                    "border-border",
            };

        default:
            return {
                badge:
                    "bg-muted text-muted-foreground",
                icon:
                    "bg-muted text-muted-foreground",
                border:
                    "border-border",
            };


    }
}

function TerraxNodeComponent({
    data,
}: NodeProps<TerraxNode>) {
    const span = data.span;

    const isError =
        span.status === "ERROR" ||
        span.errorMessage !== undefined;

    const classes = getTypeClasses(span.type);

    return (
        <div
            className={[
                "group relative w-[270px] overflow-hidden rounded-2xl border",
                "bg-background/95 shadow-lg backdrop-blur-sm",
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-xl",
                classes.border,
                isError
                    ? "border-destructive/50 shadow-destructive/10"
                    : "",
            ].join(" ")}
        > <Handle
                type="target"
                position={Position.Top}
                className="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground"
            />


            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <div
                        className={[
                            "flex h-7 w-7 items-center justify-center rounded-lg",
                            "text-xs font-semibold",
                            classes.icon,
                        ].join(" ")}
                    >
                        {getTypeSymbol(span.type)}
                    </div>

                    <span
                        className={[
                            "rounded-md px-2 py-1",
                            "text-[9px] font-bold tracking-[0.14em]",
                            classes.badge,
                        ].join(" ")}
                    >
                        {getTypeLabel(span.type)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={[
                            "h-2 w-2 rounded-full",
                            isError
                                ? "bg-destructive"
                                : "bg-emerald-500",
                        ].join(" ")}
                    />

                    {isError && (
                        <span className="text-[9px] font-bold tracking-wider text-destructive">
                            ERROR
                        </span>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="space-y-4 p-4">
                <div className="min-w-0">
                    <div
                        className="truncate text-sm font-semibold"
                        title={span.name}
                    >
                        {span.name}
                    </div>

                    {span.framework && (
                        <div className="mt-1 truncate text-[11px] text-muted-foreground">
                            {span.framework}
                        </div>
                    )}
                </div>

                {/* LLM information */}
                {span.type === "llm" && (
                    <div className="space-y-2 rounded-lg bg-muted/40 p-3">
                        {span.provider && (
                            <div className="text-[11px] text-muted-foreground">
                                {span.provider}
                            </div>
                        )}

                        {span.model && (
                            <div
                                className="truncate text-xs font-medium"
                                title={span.model}
                            >
                                {span.model}
                            </div>
                        )}
                    </div>
                )}

                {/* Tool information */}
                {span.type === "tool" &&
                    span.toolInput !== undefined && (
                        <div className="rounded-lg bg-muted/40 p-3">
                            <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Input
                            </div>

                            <div
                                className="truncate text-xs text-muted-foreground"
                                title={
                                    typeof span.toolInput === "string"
                                        ? span.toolInput
                                        : JSON.stringify(span.toolInput)
                                }
                            >
                                {typeof span.toolInput === "string"
                                    ? span.toolInput
                                    : JSON.stringify(span.toolInput)}
                            </div>
                        </div>
                    )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 border-t pt-3">
                    <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                            Duration
                        </div>

                        <div className="mt-1 text-xs font-medium">
                            {formatDuration(span.durationMs)}
                        </div>
                    </div>

                    {span.type === "llm" ? (
                        <div>
                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                Tokens
                            </div>

                            <div className="mt-1 text-xs font-medium">
                                {formatTokens(span.totalTokens)}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                Status
                            </div>

                            <div
                                className={[
                                    "mt-1 text-xs font-medium",
                                    isError
                                        ? "text-destructive"
                                        : "text-foreground",
                                ].join(" ")}
                            >
                                {isError ? "Failed" : "Success"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Error indicator */}
                {isError && (
                    <div className="flex items-center gap-2 border-t pt-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive" />

                        <span className="text-[10px] font-medium text-destructive">
                            Error occurred
                        </span>
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground"
            />
        </div>


    );
}

const nodeTypes = {
    terrax: TerraxNodeComponent,
};

function createGraph(
    roots: TraceTreeNode[],
): {
    nodes: TerraxNode[];
    edges: Edge[];
} {
    const nodes: TerraxNode[] = [];
    const edges: Edge[] = [];

    const levelCounts = new Map<number, number>();

    function walk(
        node: TraceTreeNode,
        depth: number,
        parentId?: string,
    ) {
        const id = node.span.spanId;


        const currentLevelCount =
            levelCounts.get(depth) ?? 0;

        levelCounts.set(
            depth,
            currentLevelCount + 1,
        );

        nodes.push({
            id,
            type: "terrax",

            position: {
                x: currentLevelCount * 340,
                y: depth * 260,
            },

            data: {
                span: node.span,
            },
        });

        if (parentId) {
            const isError =
                node.span.status === "ERROR" ||
                node.span.errorMessage !== undefined;

            edges.push({
                id: `${parentId}-${id}`,
                source: parentId,
                target: id,
                type: "smoothstep",
                animated: !isError,
                style: {
                    strokeWidth: 1.5,
                },
            });
        }

        for (const child of node.children) {
            walk(child, depth + 1, id);
        }


    }

    for (const root of roots) {
        walk(root, 0);
    }

    return {
        nodes,
        edges,
    };
}

export function TraceGraph({
    roots,
}: TraceGraphProps) {
    const { nodes, edges } = createGraph(roots);

    if (nodes.length === 0) {
        return (<div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
            No graph data available. </div>
        );
    }

    return (<div className="relative h-[650px] w-full overflow-hidden rounded-2xl border bg-muted/10">
        {/* Graph header */} <div className="pointer-events-none absolute left-4 top-4 z-10"> <div className="rounded-lg border bg-background/90 px-3 py-2 shadow-sm backdrop-blur"> <div className="text-xs font-semibold">
            Execution Graph </div>

            <div className="mt-0.5 text-[10px] text-muted-foreground">
                AI execution hierarchy
            </div>
        </div>
        </div>

        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
                padding: 0.2,
            }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            minZoom={0.25}
            maxZoom={1.5}
            defaultEdgeOptions={{
                type: "smoothstep",
            }}
        >
            <Background gap={24} size={1} />

            <Controls
                showInteractive={false}
                className="!m-4"
            />
        </ReactFlow>
    </div>


    );
}
